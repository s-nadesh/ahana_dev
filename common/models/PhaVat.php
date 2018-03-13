<?php

namespace common\models;

use common\models\query\PhaVatQuery;
use yii\db\ActiveQuery;
use Yii;

/**
 * This is the model class for table "pha_vat".
 *
 * @property integer $vat_id
 * @property integer $tenant_id
 * @property string $vat
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class PhaVat extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_vat';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['vat'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['vat'], 'number'],
                ['vat', 'compare', 'compareValue' => 99, 'operator' => '<='],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['vat'], 'unique', 'targetAttribute' => ['tenant_id', 'vat', 'deleted_at'], 'message' => 'The combination has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'vat_id' => 'Vat ID',
            'tenant_id' => 'Tenant ID',
            'vat' => 'Vat',
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
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaVatQuery(get_called_class());
    }

    public static function getVatList($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

    public function fields() {
        $extend = [
            'cgst_percent' => function ($model) {
                return 2.5;
            },
            'sgst_percent' => function ($model) {
                return 2.5;
            },
        ];
        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'pharm_sale_prod_json':
                    //$addt_keys = ['cgst_percent', 'sgst_percent'];
                    $parent_fields = [
                        'vat' => 'vat'
                    ];
                    break;
                case 'pharm_purchase_prod_json':
                    $parent_fields = [
                        'vat' => 'vat'
                    ];
                    break;
            endswitch;
        }

        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Vat Added Successfully (#' . $this->vat . ' )';
        else
            $activity = 'Vat Updated Successfully (#' . $this->vat . ' )';
        CoAuditLog::insertAuditLog(PhaVat::tableName(), $this->vat_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
