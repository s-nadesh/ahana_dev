<?php

namespace common\models;

use common\models\query\PhaDrugGenericQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_drug_generic".
 *
 * @property integer $drug_generic_id
 * @property integer $tenant_id
 * @property integer $drug_class_id
 * @property integer $generic_id
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaGeneric $generic
 * @property PhaDrugClass $drug
 * @property CoTenant $tenant
 */
class PhaDrugGeneric extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_drug_generic';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['drug_class_id', 'generic_id'], 'required'],
                [['tenant_id', 'drug_class_id', 'generic_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
//            [['drug_class_id'], 'unique', 'targetAttribute' => ['tenant_id', 'drug_class_id', 'deleted_at']],
            [['generic_id'], 'unique', 'targetAttribute' => ['tenant_id', 'generic_id', 'deleted_at']],
//            [['drug_class_id'], 'unique', 'targetAttribute' => ['tenant_id', 'drug_class_id', 'generic_id', 'deleted_at'], 'message' => 'The combination of Drug Class Name & Generic has already been taken.'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'drug_generic_id' => 'Drug Generic ID',
            'tenant_id' => 'Tenant ID',
            'drug_class_id' => 'Drug Class',
            'generic_id' => 'Generic',
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
    public function getGeneric() {
        return $this->hasOne(PhaGeneric::className(), ['generic_id' => 'generic_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getDrug() {
        return $this->hasOne(PhaDrugClass::className(), ['drug_class_id' => 'drug_class_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaDrugGenericQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'drug_name' => function ($model) {
                return (isset($model->drug) ? $model->drug->drug_name : '-');
            },
            'generic_name' => function ($model) {
                return (isset($model->generic) ? $model->generic->generic_name : '-');
            },
            'genericnames' => function ($model) {
                return (isset($model->drug->generics) ? $model->drug->generics : '-');
            },
        ];

        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'presc_search':
                    $addt_keys = ['drug_name', 'generic_name'];
                    $parent_fields = [
                        'drug_class_id' => 'drug_class_id',
                        'generic_id' => 'generic_id',
                    ];
                    break;
                case 'drug_genericnames':
                    $addt_keys = ['drug_name', 'generic_name', 'genericnames'];
                    $parent_fields = [
                        'drug_class_id' => 'drug_class_id',
                        'generic_id' => 'generic_id',
                    ];
                    break;
            endswitch;
        }

        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            $drug = PhaDrugClass::find()->where(['drug_class_id' => $this->drug_class_id])->one();
            $generic = PhaGeneric::find()->where(['generic_id' => $this->generic_id])->one();
            $activity = "$drug->drug_name Added $generic->generic_name Successfully";
            CoAuditLog::insertAuditLog(CoPatientGroupsPatients::tableName(), $this->drug_generic_id, $activity);
        }
        parent::afterSave($insert, $changedAttributes);
    }

}
