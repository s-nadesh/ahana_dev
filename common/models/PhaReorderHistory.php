<?php

namespace common\models;

use common\models\query\PhaReorderHistoryQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_reorder_history".
 *
 * @property integer $reorder_id
 * @property integer $tenant_id
 * @property integer $supplier_id
 * @property integer $user_id
 * @property string $reorder_date
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoUser $user
 * @property PhaSupplier $supplier
 * @property CoTenant $tenant
 * @property PhaReorderHistoryItem[] $phaReorderHistoryItems
 */
class PhaReorderHistory extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_reorder_history';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['supplier_id', 'user_id'], 'required'],
                [['tenant_id', 'supplier_id', 'user_id', 'created_by', 'modified_by'], 'integer'],
                [['reorder_date', 'created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['status'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'reorder_id' => 'Reorder ID',
            'tenant_id' => 'Tenant ID',
            'supplier_id' => 'Supplier',
            'user_id' => 'User',
            'reorder_date' => 'Reorder Date',
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
    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'user_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getSupplier() {
        return $this->hasOne(PhaSupplier::className(), ['supplier_id' => 'supplier_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPhaReorderHistoryItems() {
        return $this->hasMany(PhaReorderHistoryItem::className(), ['reorder_id' => 'reorder_id'])->active();
    }

    public function fields() {
        $extend = [
            'supplier' => function ($model) {
                return (isset($model->supplier) ? $model->supplier : '-');
            },
            'items' => function ($model) {
                return (isset($model->phaReorderHistoryItems) ? $model->phaReorderHistoryItems : '-');
            },
            'user' => function ($model) {
                return (isset($model->user) ? $model->user : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function find() {
        return new PhaReorderHistoryQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            $activity = 'Reorder Created Successfully (#' . $this->reorder_id . ' )';
            CoAuditLog::insertAuditLog(PhaReorderHistory::tableName(), $this->reorder_id, $activity);
        }
        return parent::afterSave($insert, $changedAttributes);
    }
}
