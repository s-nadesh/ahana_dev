<?php

namespace common\models;

use common\models\query\PatPrescriptionItemsQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_prescription_items".
 *
 * @property integer $pres_item_id
 * @property integer $tenant_id
 * @property integer $pres_id
 * @property integer $product_id
 * @property string $product_name
 * @property integer $generic_id
 * @property string $generic_name
 * @property integer $drug_class_id
 * @property string $drug_name
 * @property integer $route_id
 * @property integer $freq_id
 * @property integer $number_of_days
 * @property string $remarks
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaDrugClass $drugClass
 * @property PatPrescriptionFrequency $freq
 * @property PhaGeneric $generic
 * @property PatPrescription $pres
 * @property PhaProduct $product
 * @property PatPrescriptionRoute $route
 * @property CoTenant $tenant
 */
class PatPrescriptionItems extends RActiveRecord {

    public $route;
    public $frequency;
    public $is_favourite;
    public $consultant_id;
    public $freqType;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_prescription_items';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['product_id', 'product_name', 'generic_id', 'generic_name', 'drug_class_id', 'drug_name', 'number_of_days'], 'required'],
                [['route', 'frequency'], 'required', 'on' => 'saveform'],
                [['tenant_id', 'pres_id', 'product_id', 'generic_id', 'drug_class_id', 'route_id', 'freq_id', 'number_of_days', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at', 'route', 'frequency', 'is_favourite', 'remarks', 'consultant_id', 'freqType', 'quantity', 'food_type'], 'safe'],
                [['product_name', 'generic_name', 'drug_name'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'pres_item_id' => 'Pres Item ID',
            'tenant_id' => 'Tenant ID',
            'pres_id' => 'Pres ID',
            'product_id' => 'Product ID',
            'product_name' => 'Product Name',
            'generic_id' => 'Generic ID',
            'generic_name' => 'Generic Name',
            'drug_class_id' => 'Drug Class ID',
            'drug_name' => 'Drug Name',
            'route_id' => 'Route ID',
            'freq_id' => 'Freq ID',
            'quantity' => 'Quantity',
            'number_of_days' => 'Number Of Days',
            'food_type' => 'Food Type',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getDrugClass() {
        return $this->hasOne(PhaDrugClass::className(), ['drug_class_id' => 'drug_class_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getFreq() {
        return $this->hasOne(PatPrescriptionFrequency::className(), ['freq_id' => 'freq_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getGeneric() {
        return $this->hasOne(PhaGeneric::className(), ['generic_id' => 'generic_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPres() {
        return $this->hasOne(PatPrescription::className(), ['pres_id' => 'pres_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getProduct() {
        return $this->hasOne(PhaProduct::className(), ['product_id' => 'product_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPresRoute() {
        return $this->hasOne(PatPrescriptionRoute::className(), ['route_id' => 'route_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PatPrescriptionItemsQuery(get_called_class());
    }

    public function setFrequencyId($item) {
        $model = PatPrescriptionFrequency::find()
                ->tenant()
                ->andWhere(['freq_name' => $this->frequency, 'consultant_id' => $this->consultant_id])
                //->status()
                ->active()
                ->one();
        if (empty($model)) {
            $model = new PatPrescriptionFrequency;
            $model->freq_name = $this->frequency;
            $model->freq_type = $this->freqType;
            $model->consultant_id = $this->consultant_id;
            $model->product_type = $item['description_name'];
            $model->save(false);
        } else {
            $model->status = 1;
            $model->save(false);
        }
        $this->freq_id = $model->freq_id;
    }

    public function setRouteId() {
        $model = PatPrescriptionRoute::find()->tenant()->andWhere(['route_name' => $this->route])->status()->active()->one();

        if (empty($model)) {
            $model = new PatPrescriptionRoute;
            $model->route_name = $this->route;
            $model->save(false);
        }
        $this->route_id = $model->route_id;
    }

    public function afterSave($insert, $changedAttributes) {
        $this->_addFaourite();
        return parent::afterSave($insert, $changedAttributes);
    }

    private function _addFaourite() {
        if ($this->is_favourite == 1) {
            $prescription = $this->pres;

            $model = PatPrescriptionFavourite::find()->tenant()->andWhere([
                        'encounter_id' => $prescription->encounter_id,
                        'patient_id' => $prescription->patient_id,
                        'product_id' => $this->product_id,
                        'consultant_id' => $prescription->consultant_id,
                    ])->status()->active()->one();

            if (empty($model))
                $model = new PatPrescriptionFavourite;

            $model->attributes = [
                'encounter_id' => $prescription->encounter_id,
                'patient_id' => $prescription->patient_id,
                'product_id' => $this->product_id,
                'product_name' => $this->product_name,
                'generic_id' => $this->generic_id,
                'drug_class_id' => $this->drug_class_id,
                'consultant_id' => $prescription->consultant_id,
                'pres_id' => $prescription->pres_id,
            ];
            $model->save(false);
        }
    }

    public function fields() {
        $extend = [
            'frequency_name' => function ($model) {
                return (isset($model->freq) ? $model->freq->freq_name : '-');
            },
            'freqType' => function ($model) {
                return (isset($model->freq) ? $model->freq->freq_type : '-');
            },
            'route_name' => function ($model) {
                return (isset($model->presRoute) ? $model->presRoute->route_name : '-');
            },
            'product' => function ($model) {
                return (isset($model->product) ? $model->product : '-');
            },
        ];
        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'presc_print':
                    $addt_keys = ['frequency_name', 'freqType', 'product'];
                    $parent_fields = [
                        'product_name' => 'product_name',
                        'generic_name' => 'generic_name',
                        'number_of_days' => 'number_of_days',
                        'food_type' => 'food_type',
                        'remarks' => 'remarks',
                        'quantity' => 'quantity'
                    ];
                    break;
            endswitch;
        }

        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

}
